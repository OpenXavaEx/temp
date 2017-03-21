#import "BKIM_RN.h"

@implementation BKIM_RN

-(void)callFunc: (UIViewController*)view : (NSString*)title {
    NSLog(@"call function");
    
    
    UIAlertController * alert = [UIAlertController
                                 alertControllerWithTitle:title
                                 message:@"Test begining ..."
                                 preferredStyle:UIAlertControllerStyleAlert
                                 ];
    UIAlertAction *okAction = [
                               UIAlertAction actionWithTitle:@"OK"
                               style:UIAlertActionStyleDefault handler:nil
                               ];
    [alert addAction:okAction];
    
    [view presentViewController:alert animated:YES completion:nil];

}

@end
